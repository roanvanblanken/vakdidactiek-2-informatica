import { loadPyodide } from './node_modules/pyodide/pyodide.mjs';
import { MATCHLAB_PYTHON, DISPATCH_PYTHON } from '../../js/python-library.js';
const python = await loadPyodide();
python.FS.writeFile('/home/pyodide/matchlab.py', MATCHLAB_PYTHON);
python.runPython(DISPATCH_PYTHON);
python.globals.set('_request_json', JSON.stringify({
  type: 'train',
  code: 'from matchlab import MLAgent\nclass MijnAgent(MLAgent):\n    pass',
  episodes: 5000, seed: 42, parameters: { environment: 'focus' },
}));
const started = performance.now();
const result = JSON.parse(python.runPython('_dispatch(_request_json)'));
console.log(JSON.stringify({ elapsedMs: Math.round(performance.now()-started),
  training: result.training, validation: result.validation, episodes: result.model.episodes }, null, 2));
