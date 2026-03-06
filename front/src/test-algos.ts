/**
 * 算法 Trace 生成测试
 * 验证所有栈和队列算法的 trace 能够正常生成
 */

// 栈算法
import { generateValidParenthesesTrace } from './core/stack/valid-parentheses';
import { generateMinStackTrace, MIN_STACK_DEFAULT_OPS } from './core/stack/min-stack';
import { generateMonotonicStackTrace } from './core/stack/monotonic-stack';
import { generateRPNCalculatorTrace } from './core/stack/rpn-calculator';
import { generateQueueByStackTrace, QUEUE_BY_STACK_DEFAULT_OPS } from './core/stack/queue-by-stack';

// 队列算法
import { generateQueueBasicTrace, QUEUE_BASIC_DEFAULT_OPS } from './core/queue/basic';
import { generateCircularQueueTrace, CIRCULAR_QUEUE_DEFAULT_OPS } from './core/queue/circular-queue';
import { generateDequeTrace, DEQUE_DEFAULT_OPS } from './core/queue/deque';

type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
  stepCount?: number;
};

const results: TestResult[] = [];

function testAlgo(name: string, fn: () => any) {
  try {
    const trace = fn();
    const steps = trace?.steps;
    if (!Array.isArray(steps) || steps.length === 0) {
      results.push({ name, passed: false, error: 'Trace is empty or invalid' });
    } else {
      results.push({ name, passed: true, stepCount: steps.length });
    }
  } catch (error: any) {
    results.push({ name, passed: false, error: error?.message || 'Unknown error' });
  }
}

console.log('=== 栈算法 Trace 生成测试 ===\n');

testAlgo('有效的括号', () => generateValidParenthesesTrace('({[]})'));
testAlgo('最小栈', () => generateMinStackTrace(MIN_STACK_DEFAULT_OPS));
testAlgo('单调栈', () => generateMonotonicStackTrace([2, 1, 5, 6, 2, 3]));
testAlgo('逆波兰表达式', () => generateRPNCalculatorTrace(['2', '1', '+', '3', '*']));
testAlgo('栈实现队列', () => generateQueueByStackTrace(QUEUE_BY_STACK_DEFAULT_OPS));

console.log('\n=== 队列算法 Trace 生成测试 ===\n');

testAlgo('队列基本操作', () => generateQueueBasicTrace(QUEUE_BASIC_DEFAULT_OPS));
testAlgo('循环队列', () => generateCircularQueueTrace(5, CIRCULAR_QUEUE_DEFAULT_OPS));
testAlgo('双端队列', () => generateDequeTrace(DEQUE_DEFAULT_OPS));

console.log('\n=== 测试结果 ===\n');

let passedCount = 0;
let failedCount = 0;

results.forEach((result) => {
  if (result.passed) {
    console.log(`✅ ${result.name} - 通过 (${result.stepCount} 步)`);
    passedCount++;
  } else {
    console.log(`❌ ${result.name} - 失败: ${result.error}`);
    failedCount++;
  }
});

console.log(`\n总计: ${passedCount} 通过, ${failedCount} 失败`);

if (failedCount > 0) {
  throw new Error(`Trace tests failed: ${failedCount}`);
}
