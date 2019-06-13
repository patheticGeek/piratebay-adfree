import React, { Component } from 'react';

export default class Navbar extends Component {
  state = { darkMode: false };

  toogleDarkMode = () => {
    !this.state.darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
    this.setState({ darkMode: !this.state.darkMode });
    this.saveState({ darkMode: !this.state.darkMode });
  };

  componentDidMount() {
    this.loadState();
  }

  loadState = () => {
    try {
      const serializedState = localStorage.getItem('piratebayadfree.tk/state');
      if (serializedState !== null) {
        const state = JSON.parse(serializedState);
        state.darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
        this.setState({ ...state });
      }
    } catch (e) {}
  };

  saveState = state => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('piratebayadfree.tk/state', serializedState);
    } catch (e) {}
  };

  render() {
    return (
      <nav>
        <div className='content'>
          <div className='logo'>Piratebay</div>
          <div className='links'>
            <div className='icon darkMode' title='Toogle dark mode' onClick={this.toogleDarkMode} />
          </div>
        </div>
      </nav>
    );
  }
}
