import { StyledApp, JSXApp, type JSXChild } from '@nosh/compact'
import React from 'react'
// @ts-expect-error - compilation happens at runtime
import css from '../styles/globals.css'
const NavList = (linkmaps: Record<string, string>) => (<ul>{Object.keys(linkmaps).map((key) => (<a href={linkmaps[key]}><li>{key}</li></a>))}</ul>)
const NavBar = ({ items }: {items: (JSXChild|string)[]}) => (<ul id="navbar">{items.map((item) => (<li>{item}</li>))}</ul>)
const Layout = (args: Record<string, string | React.JSX.Element>) => {
  const children: React.JSX.Element = args.children as React.JSX.Element
  return (
    <StyledApp styles={[css]}>
      <h1 id="layout-headline">Indomitable Pragma</h1>
      <NavBar items={[
        (<span>Home</span>),
        (<><span>Stuff</span>{NavList({ Page1: '/page1', Page2: '/page2' })}</>),
        (<span>Contact</span>)
      ]} />
      {children}
    </StyledApp>
  )
}

export default Layout
