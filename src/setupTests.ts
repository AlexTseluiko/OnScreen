import '@testing-library/jest-dom';

// Мок для fetch API
global.fetch = jest.fn();

// Очистка моков после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});
