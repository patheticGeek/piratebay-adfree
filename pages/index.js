import React, { Component } from 'react';
import 'isomorphic-fetch';
import loadingSvg from '../assets/loading.svg';
import Link from 'next/link';
import '../assets/index.css';
const dev = process.env.NODE_ENV !== 'production';

export default class Index extends Component {
  static async getInitialProps() {
    const api = 'https://piratebay-adfree.herokuapp.com';
    const localhost = 'http://localhost:3000';
    const response = await fetch(`${dev ? localhost : api}/sitesAvail`);
    if (response.status !== 200) {
      return { error: true, message: 'Cannot reach Servers' };
    }
    const proxiesAvail = await response.json();
    return { proxiesAvail };
  }

  state = {
    site: '',
    searchTerm: '',
    searchResults: {},
    torrentLink: '',
    torrentDetails: {},
    proxiesAvail: this.props.proxiesAvail,
    nav: 'selectProxies',
    searchResultsLoading: false,
    torrentDetailsLoading: false
  };

  handleInput = e => this.setState({ [e.target.name]: e.target.value });

  selectProxy = e => {
    this.setState({ site: e.target.id, nav: 'searchBar' });
  };

  searchTorrents = async () => {
    this.setState({ searchResultsLoading: true });
    const api = 'https://piratebay-adfree.herokuapp.com';
    const localhost = 'http://localhost:3000';
    const response = await fetch(
      `${dev ? localhost : api}/getSearch?site=${this.state.site}&search=${this.state.searchTerm}`
    );
    if (response.status !== 200) {
      this.setState({ searchResults: { error: true, message: 'Cannot reach server' } });
    }
    const searchResults = await response.json();
    this.setState({ searchResults, searchResultsLoading: false });
  };

  render() {
    return (
      <main>
        {this.state.nav === 'selectProxies' && (
          <div className='proxyAvailWrapper'>
            <h2>Select a proxy server</h2>
            {this.state.proxiesAvail.proxies.length > 0 &&
              this.state.proxiesAvail.proxies.map((proxy, i) => (
                <div className='card proxyAvail' key={i}>
                  <div className='card-body'>
                    <h3>{proxy.name}</h3>
                    <span>{proxy.country}</span>
                    <span>{proxy.speed}</span>
                    <button className='primary' id={proxy.site} onClick={this.selectProxy}>
                      Use this
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
        {this.state.nav === 'searchBar' && (
          <div className='searchBarWrapper'>
            <h2>Search torrents</h2>
            <div className='input-group'>
              <input
                className='form-input'
                placeholder='Search something...'
                onChange={this.handleInput}
                name='searchTerm'
              />
              <button className='primary' onClick={this.searchTorrents}>
                Search
              </button>
            </div>
          </div>
        )}
        {this.state.searchResultsLoading && <img className='loading' src={loadingSvg} alt='loading' />}
        {this.state.searchResults.results &&
          this.state.searchResults.results.map((result, i) => (
            <div key={i} className='card'>
              <div className='card-body'>
                <h3>{result.name}</h3>
                <p>{result.details}</p>
                <span>Seeds: {result.seeds}</span>
              </div>
              <div className='card-action'>
                <Link href={`/torrent?link=${result.link}`} prefetch={i < 3}>
                  <button className='primary'>Open this</button>
                </Link>
              </div>
            </div>
          ))}
        <div className='credits'>
          Made by <a href='https://instagram.com/pathetic_geek'>@pathetic_geek</a>
        </div>
      </main>
    );
  }
}
