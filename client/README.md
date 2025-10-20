# Trizen

## Stacks and technologies

![React](https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwind_css-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/react_router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![ESLint](https://img.shields.io/badge/eslint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white)

### Project Structure

The project is organized into the following directories and files:

```mermaid
graph TB
  src
  src --> App[App.tsx]
  src --> main[main.tsx]

  src --> UI[UI Components]
  UI --> components[components]
  UI --> pages[pages]
  UI --> features[features]

  src --> Shared[Shared]
  Shared --> common[common]
  common --> constants[constants]
  common --> hooks[hooks]
  common --> interfaces[interfaces]
  common --> types[types]
  common --> utils[utils]

  src --> routes[routes]


  src --> Assets[Assets]
  Assets --> assets[Images]
  Assets --> styles[Icons]

  src --> context[Context]
  src --> config[Config]
  src --> lib[Lib]
  src --> locales[Locales]

  src --> providers[providers]



```
