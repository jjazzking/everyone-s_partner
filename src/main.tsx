import {Component, StrictMode, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 렌더링 중 예외가 나면 화면이 통째로 비어버리기 때문에(흰 화면),
// 최소한 원인을 화면에 노출한다.
class ErrorBoundary extends Component<
  {children: ReactNode},
  {error: Error | null}
> {
  state: {error: Error | null} = {error: null};

  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  componentDidCatch(error: Error) {
    console.error('Rendering failed:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-2xl p-8 font-mono text-sm text-slate-200">
          <h1 className="mb-3 text-lg font-semibold text-rose-400">
            화면을 그리는 중 오류가 발생했습니다
          </h1>
          <pre className="overflow-auto whitespace-pre-wrap rounded-lg bg-slate-800 p-4">
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('#root element not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
