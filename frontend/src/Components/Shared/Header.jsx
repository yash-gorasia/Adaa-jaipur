import React from 'react';
import Nav from './Nav';
import MobileNav from './MobileNav';

export default function Header({ transparent = true }) {
  //bg-dark-brown hidden md:flex shadow-md sticky top-0 z-20 mx-auto flex items-center justify-between p-6
  return (
    <div>
    <header className='hidden md:flex '>
      <Nav transparent={transparent} />
    </header>
    <MobileNav />
    </div>
  );
}
