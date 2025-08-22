# @core/src

The `@core/src` directory is where the primary business logic of the application resides. Each subdirectory represents a self-contained "module" that encapsulates a specific domain of functionality central to the application's purpose

## Core Principles

- **Shared Services**: Common functionalities that can be used across different modules, such as database interactions or file handling, are provided as shared services within the `@core/src` directory via the `BaseModule`.

## Main

This is the central core that tresolves the main purpose of the aplication.

## Plugins

Plugins are also modules but are in a separate folder and provide secondary functionalities. They can be integrated into the application but are not essential for its core operation.

Examples include:

- **`EntrepriseResourcePlanning`**: Manages company-wide resources, including personnel, projects, and scheduling.
- **`IndustryFoundationClasses`**: Provides tools for importing, viewing, and interacting with BIM data using the IFC standard.
- **`SwissApartmentsDataset`**: Integrates and visualizes a specialized dataset of Swiss apartment layouts and statistics.
