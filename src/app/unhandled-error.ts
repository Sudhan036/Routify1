// unhandled-error.ts

const digestSym: unique symbol = Symbol('digestSym');
const consoleTypeSym: unique symbol = Symbol('consoleTypeSym');

export type UnhandledError = Error & {
  [digestSym]: 'NEXT_UNHANDLED_ERROR';
  [consoleTypeSym]: 'string' | 'error';
};

export function createUnhandledError(message: string | Error): UnhandledError {
  const error = typeof message === 'string' ? new Error(message) : message;

  (error as UnhandledError)[digestSym] = 'NEXT_UNHANDLED_ERROR';
  (error as UnhandledError)[consoleTypeSym] =
    typeof message === 'string' ? 'string' : 'error';

  return error as UnhandledError;
}

export const isUnhandledConsoleOrRejection = (
  error: any
): error is UnhandledError => {
  return (
    error instanceof Error &&
    (error as any)[digestSym] === 'NEXT_UNHANDLED_ERROR'
  );
};

export const getUnhandledErrorType = (
  error: UnhandledError
): 'string' | 'error' => {
  return error[consoleTypeSym];
};
