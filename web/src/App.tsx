import { MantineProvider } from '@mantine/core';
import { Market } from './market/Market';
import './App.css'
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider defaultColorScheme='dark'>
      <Market/>
    </MantineProvider>
  )
}

export default App
