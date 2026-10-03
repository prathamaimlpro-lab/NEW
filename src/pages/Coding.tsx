import { CodingPractice } from '../components/practice/CodingPractice';
import { codingTasks } from '../data/codingTasks';
import { codingSolvedCount } from '../services/codingService';

export default function Coding() {
  const solved = codingSolvedCount();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header className="ui-statement">
        <h1 className="ui-h1">Pixel Code</h1>
        <p className="ui-desc">Write real JavaScript, run it in your browser, pass the tests. {solved} of {codingTasks.length} solved.</p>
      </header>
      <CodingPractice />
    </div>
  );
}
