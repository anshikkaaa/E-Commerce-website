import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Navbar } from './Components/Navbar/Navbar';
import { Shop } from './pages/Shop';
import { ShopCategory } from './pages/ShopCategory';
import { Product } from './pages/Product';
import { Cart } from './pages/Cart';
import { LoginSignup } from './pages/LoginSignup';
import men_banner from './Components/Assets/banner_mens.png'
import women_banner from './Components/Assets/banner_women.png'
import kid_banner from './Components/Assets/banner_kids.png'
import { Footer } from './Components/Footer/Footer';

function App() {
  return (
    <div >
      <Navbar></Navbar>
      <Routes>
        <Route path='/' element={<Shop/>}></Route>
        <Route path='/Men' element={<ShopCategory banner = {men_banner}category="men" />}></Route>
        <Route path='/Women' element={<ShopCategory banner = {women_banner}category = "women"/>}></Route>
        <Route path='/Kids' element={<ShopCategory banner = {kid_banner}category = "kid"/>}></Route>
        <Route path='/product' element={<Product/>}>
          <Route path=':productId' element={<Product/>} />
        </Route>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/Login' element={<LoginSignup/>}/>
      </Routes>
      <div>
        <Footer/>
      </div>
    </div>
  );
}

export default App;
