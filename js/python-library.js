// This source is both executed by Pyodide and downloadable as matchlab.py.
// It intentionally depends only on Python's standard library.
export const MATCHLAB_PYTHON = String.raw`"""Matchlab: inspecteer kaarten, leer zoekprioriteiten en vergelijk eerlijk.

Een agent ziet alleen zijn eigen kaart, mislukte controles en zijn eigen geheugen.
evaluate(observation, candidate) geeft een eindig getal; hoger betekent eerder kijken.
Dit is een lesmodel voor zoekbeleid, geen beeldherkenningsnetwerk.
"""
import copy
import json
import math
import numbers
import random


def _model(data=None):
    data = data or {}
    values = data.get('q', {})
    result = {'q': {str(i): 0.125 for i in range(57)},
              'episodes': int(data.get('episodes', 0)),
              'history': copy.deepcopy(data.get('history', []))[-200:]}
    if result['episodes'] < 0:
        raise ValueError('Het aantal trainingen mag niet negatief zijn.')
    for key, value in values.items():
        symbol = int(key)
        if not 0 <= symbol < 57 or not isinstance(value, numbers.Real) or not math.isfinite(value) or not 0 <= value <= 1:
            raise ValueError('Een leergewicht moet een eindig getal tussen 0 en 1 zijn.')
        result['q'][str(symbol)] = float(value)
    return result


class EvaluationAgent:
    """Bepaal zelf welke kandidaat je als volgende wilt inspecteren."""
    def __init__(self, model=None):
        self.model = _model(model)
        self.memory = {'q': {int(key): value for key, value in self.model['q'].items()}}
        self._source_code = ''
        self._parameters = {}

    def evaluate(self, observation, candidate):
        return candidate['frequency'] / candidate['cost']


class MLAgent(EvaluationAgent):
    """De standaardstrategie gebruikt de geleerde kans op een eerste treffer."""
    def evaluate(self, observation, candidate):
        return candidate['q']


def _deck(q=7):
    if q not in (3, 5, 7):
        raise ValueError('Kies kaartorde 3, 5 of 7.')
    cards = []
    infinity = q * q
    for slope in range(q):
        for offset in range(q):
            cards.append([x*q + (slope*x + offset) % q for x in range(q)] + [infinity+slope])
    for x in range(q):
        cards.append([x*q+y for y in range(q)] + [infinity+q])
    cards.append(list(range(infinity, infinity+q+1)))
    return cards


def _pair(deck, rng, environment):
    if environment not in ('focus', 'uniform'):
        raise ValueError('De oefenwereld moet focus of uniform zijn.')
    if environment == 'focus' and rng.random() < 0.75:
        target = rng.randrange(min(8, len(deck)))
        containing = [card for card in deck if target in card]
        pair = rng.sample(containing, 2)
    else:
        pair = rng.sample(deck, 2)
    a, b = list(pair[0]), list(pair[1])
    rng.shuffle(a)
    rng.shuffle(b)
    return a, b


def _valid_pair(mine, other):
    for card in (mine, other):
        if not isinstance(card, list) or not card or len(card) > 8 or len(card) != len(set(card)):
            raise ValueError('Een kaart bevat 1 tot 8 verschillende symbool-ID’s.')
        if any(type(i) is not int or not 0 <= i < 57 for i in card):
            raise ValueError('Kaart-ID’s moeten gehele getallen van 0 tot en met 56 zijn.')
    common = set(mine).intersection(other)
    if len(common) != 1:
        raise ValueError('Twee kaarten moeten precies één symbool gemeen hebben.')
    return next(iter(common))


def _candidates(agent, mine, environment, q):
    count = q*q+q+1
    weights = {i: ((0.75/8 if i < 8 else 0) + 0.25/count)
               if environment == 'focus' else 1/count for i in mine}
    total = sum(weights.values())
    candidates = {}
    for symbol in mine:
        cost = 1 + (symbol % 8) * 0.1
        salience = 1/cost
        frequency = weights[symbol] / total
        candidates[symbol] = {'id': symbol, 'frequency': frequency, 'p': frequency,
                              'salience': salience, 'cost': cost,
                              'q': agent.model['q'].get(str(symbol), 0.125)}
    return candidates


def _rank(agent, observation, remaining, candidates):
    scored = []
    for position, symbol in enumerate(remaining):
        # Give student code its own candidate dictionary, without hidden target data.
        value = agent.evaluate(observation, dict(candidates[symbol]))
        if isinstance(value, bool) or not isinstance(value, numbers.Real) or not math.isfinite(value):
            raise ValueError('evaluate moet voor iedere kandidaat een eindig getal teruggeven, geen NaN, tekst of None.')
        scored.append((-float(value), position, symbol))
    scored.sort()
    return [item[2] for item in scored]


def _play(agent, mine, other, environment='focus', q=7, rng=None, epsilon=0, round_number=0):
    match = _valid_pair(mine, other)
    candidates = _candidates(agent, mine, environment, q)
    agent.memory['q'] = {int(key): value for key, value in agent.model['q'].items()}
    observation = {'my_card': list(mine), 'checked': [], 'memory': agent.memory, 'round': round_number}
    remaining = list(mine)
    order = []
    steps = None
    while remaining:
        ranked = _rank(agent, observation, remaining, candidates)
        symbol = ranked[0]
        if not order and epsilon and rng.random() < epsilon:
            symbol = rng.choice(remaining)
        order.append(symbol)
        remaining.remove(symbol)
        if symbol == match:
            steps = len(order)
            # The suffix is a plan for displaying the policy, not extra inspections.
            order.extend(_rank(agent, observation, remaining, candidates))
            break
        observation['checked'].append(symbol)
    search_cost = sum(candidates[symbol]['cost'] for symbol in order[:steps])
    return {'order': order, 'steps': steps, 'match': match, 'searchCost': search_cost,
            'firstHit': int(order[0] == match)}


def _episodes(value):
    if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 100000:
        raise ValueError('Kies een geheel aantal rondes tussen 1 en 100.000.')
    return value


def _rate(value, name):
    if isinstance(value, bool) or not isinstance(value, numbers.Real) or not math.isfinite(value) or not 0 <= value <= 1:
        raise ValueError(name + ' moet tussen 0 en 1 liggen.')
    return float(value)


def train(agent, episodes=500, epsilon=0.15, alpha=0.1, seed=42,
          environment='focus', q=7, progress=None):
    """Voer echte kaartproeven uit en pas q aan op de eerste inspectie.

    reward = 1 bij een directe treffer, anders 0.
    q[gekozen] = q[gekozen] + alpha * (reward - q[gekozen]).
    De leerlingfunctie evaluate wordt voor de keuzes werkelijk uitgevoerd.
    """
    episodes = _episodes(episodes)
    epsilon, alpha = _rate(epsilon, 'epsilon'), _rate(alpha, 'alpha')
    random.seed(seed)
    rng, deck = random.Random(seed), _deck(q)
    report_every = max(1, min(100, episodes // 50))
    total_steps = total_cost = hits = batch_steps = batch_cost = batch_hits = batch_count = 0
    for index in range(episodes):
        mine, other = _pair(deck, rng, environment)
        result = _play(agent, mine, other, environment, q, rng, epsilon, agent.model['episodes'])
        chosen = str(result['order'][0])
        reward = result['firstHit']
        current = agent.model['q'].get(chosen, 0.125)
        agent.model['q'][chosen] = current + alpha * (reward-current)
        agent.model['episodes'] += 1
        total_steps += result['steps']
        total_cost += result['searchCost']
        hits += reward
        batch_steps += result['steps']
        batch_cost += result['searchCost']
        batch_hits += reward
        batch_count += 1
        if (index+1) % report_every == 0 or index+1 == episodes:
            point = {'episode': agent.model['episodes'], 'meanSteps': batch_steps/batch_count,
                     'meanCost': batch_cost/batch_count, 'firstHitRate': batch_hits/batch_count}
            agent.model['history'].append(point)
            agent.model['history'] = agent.model['history'][-200:]
            if progress:
                progress(index+1, episodes, point['meanSteps'], json.dumps(agent.model, allow_nan=False))
            batch_steps = batch_cost = batch_hits = batch_count = 0
    return {'count': episodes, 'meanSteps': total_steps/episodes,
            'meanCost': total_cost/episodes, 'firstHitRate': hits/episodes, 'seed': seed, 'environment': environment}


def validate(agent, episodes=200, seed=104729, environment='focus', q=7):
    """Vergelijk op nieuwe gedeelde kaartparen zonder leergewichten bij te werken."""
    episodes = _episodes(episodes)
    evaluated = copy.deepcopy(agent)
    random.seed(seed)
    # Separate generators keep test pairs independent of policy complexity.
    pair_rng, baseline_rng = random.Random(seed), random.Random(seed+1)
    deck = _deck(q)
    total = baseline = total_cost = baseline_cost = wins = ties = first_hits = 0
    for index in range(episodes):
        mine, other = _pair(deck, pair_rng, environment)
        result = _play(evaluated, mine, other, environment, q, round_number=index)
        random_order = list(mine)
        baseline_rng.shuffle(random_order)
        random_steps = random_order.index(result['match']) + 1
        costs = _candidates(evaluated, mine, environment, q)
        total += result['steps']
        baseline += random_steps
        total_cost += result['searchCost']
        baseline_cost += sum(costs[symbol]['cost'] for symbol in random_order[:random_steps])
        wins += result['steps'] < random_steps
        ties += result['steps'] == random_steps
        first_hits += result['firstHit']
    return {'count': episodes, 'meanSteps': total/episodes,
            'baselineSteps': baseline/episodes, 'winRate': wins/episodes,
            'meanCost': total_cost/episodes, 'baselineCost': baseline_cost/episodes,
            'ties': ties/episodes, 'firstHitRate': first_hits/episodes,
            'seed': seed, 'environment': environment}


def save(agent, filename=None):
    """Geef JSON terug; schrijf optioneel een bestand bij lokaal Python-gebruik."""
    data = {'format': 'matchlab-agent', 'version': 1,
            'agent': {'name': type(agent).__name__, 'code': agent._source_code,
                      'parameters': agent._parameters, 'model': agent.model}}
    text = json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False)
    if filename is not None:
        with open(filename, 'w', encoding='utf-8') as destination:
            destination.write(text)
    return text


def load(data, agent_class=MLAgent):
    """Herstel leergeheugen. Geef MijnAgent mee om je eigen klasse te gebruiken.

    Geladen code wordt hier niet automatisch uitgevoerd. De website kan de code
    uit hetzelfde bestand in de editor openen, ter beoordeling door de leerling.
    """
    if isinstance(data, str):
        if not data.lstrip().startswith('{'):
            with open(data, encoding='utf-8') as source:
                data = source.read()
        data = json.loads(data)
    if data.get('format') != 'matchlab-agent' or data.get('version') != 1:
        raise ValueError('Geen ondersteund Matchlab-agentbestand, versie 1.')
    saved = data['agent']
    agent = agent_class()
    agent.model = _model(saved['model'])
    agent._source_code = saved.get('code', '')
    agent._parameters = saved.get('parameters', {})
    return agent
`;

// Request dispatcher is separate from the downloadable teaching library.
export const DISPATCH_PYTHON = String.raw`
import contextlib as _contextlib
import json as _json
import math as _math
from matchlab import EvaluationAgent as _EvaluationAgent, MLAgent as _MLAgent
from matchlab import train as _train, validate as _validate, _model, _play, _pair, _deck
import random as _random


class _Output:
    def __init__(self):
        self.text = ''
    def write(self, value):
        self.text += value[:max(0, 12000-len(self.text))]
        return len(value)
    def flush(self):
        pass


def _dispatch(request_json, progress=None):
    request = _json.loads(request_json)
    action = request.get('type', 'run')
    if action not in ('run', 'train', 'validate'):
        raise ValueError('Onbekende agentopdracht.')
    code = request.get('code', '')
    if not isinstance(code, str) or not code.strip() or len(code) > 60000:
        raise ValueError('Schrijf een agentklasse met evaluate; maximaal 60.000 tekens.')
    output = _Output()
    parameters = request.get('parameters') or {}
    environment = parameters.get('environment', 'focus')
    q = parameters.get('q', 7)
    seed = request.get('seed', parameters.get('seed', 42))
    if isinstance(seed, bool) or not isinstance(seed, int) or not 0 <= seed <= 2147483647:
        raise ValueError('Gebruik een gehele seed tussen 0 en 2.147.483.647.')
    _random.seed(seed)
    with _contextlib.redirect_stdout(output), _contextlib.redirect_stderr(output):
        namespace = {'__name__': '__matchlab_student__'}
        exec(compile(code, '<jouw-agent>', 'exec'), namespace)
        agent = namespace.get('agent')
        if not isinstance(agent, _EvaluationAgent):
            classes = [value for value in namespace.values()
                       if isinstance(value, type) and issubclass(value, _EvaluationAgent)
                       and value not in (_EvaluationAgent, _MLAgent)]
            if not classes:
                raise ValueError('Maak een klasse MijnAgent(EvaluationAgent) of MijnAgent(MLAgent) met def evaluate(self, observation, candidate).')
            agent = classes[-1]()
        agent.model = _model(request.get('model'))
        if not hasattr(agent, 'memory'):
            agent.memory = {}
        agent._source_code = code
        agent._parameters = parameters
        result = {}
        if action == 'train':
            result['training'] = _train(agent, episodes=request.get('episodes', 500),
                    epsilon=parameters.get('epsilon', 0.15), alpha=parameters.get('alpha', 0.1),
                    seed=seed, environment=environment, q=q, progress=progress)
            result['validation'] = _validate(agent, episodes=200, seed=(seed+104729) % 2147483648,
                                              environment=environment, q=q)
        elif action == 'validate':
            result['validation'] = _validate(agent, episodes=request.get('episodes', 200),
                                             seed=seed, environment=environment, q=q)
        rng = _random.Random(seed)
        supplied = request.get('observation')
        if supplied is not None:
            mine, other = supplied.get('my_card'), supplied.get('other_card')
        else:
            mine, other = _pair(_deck(q), rng, environment)
        result.update(_play(agent, mine, other, environment, q, round_number=agent.model['episodes']))
        result['model'] = agent.model
    result['stdout'] = output.text
    return _json.dumps(result, ensure_ascii=False, allow_nan=False)
`;
