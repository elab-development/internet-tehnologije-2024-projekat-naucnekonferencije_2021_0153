import logo from './logo.svg';
import './App.css';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
       <Navbar></Navbar>
        <HomePage></HomePage>
        <Footer>  </Footer>
    </div>
  );
}

export default App;
