module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    rootDir: './',
    verbose: true,
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1', // Ánh xạ đúng src
      '^module/(.*)$': '<rootDir>/src/module/$1', // Thêm alias nếu cần cho các module
    },
    testPathIgnorePatterns: ['<rootDir>/dist/'],
  };
  