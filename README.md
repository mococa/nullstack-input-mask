# Nullstack Input Mask

This is a simple input mask component for Nullstack.

## Installation

```bash
npm install nullstack-input-mask
```

## Usage

```jsx
import Nullstack from 'nullstack';
import { InputMask } from 'nullstack-input-mask';

export class MyComponent extends Nullstack {
    date: string = '';

    render() {
        return (
          <InputMask bind={this.date} mask="99/99/9999" replacement={{ 9: /\d/g }} placeholder="dd/mm/yyyy" />
        );
    }
}
```