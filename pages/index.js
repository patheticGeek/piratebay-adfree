import React, { Component } from 'react';
import 'isomorphic-fetch';
import loadingSvg from '../assets/loading.svg';
import Link from 'next/link';
import '../assets/index.css';
const dev = process.env.NODE_ENV !== 'production';

export default class Index extends Component {
  state = {
    site: 'https://bayunblocked.net/',
    searchTerm: '',
    searchResults: {},
    searchResultsLoading: false,
    torrentDetailsLoading: false
  };

  handleInput = e => this.setState({ [e.target.name]: e.target.value });

  searchTorrents = async () => {
    this.setState({ searchResultsLoading: true, searchResults: {} });
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

  loadingTorrent = () => this.setState({ torrentDetailsLoading: true });

  render() {
    if (this.state.torrentDetailsLoading) {
      return <img className='loading' src={loadingSvg} alt='loading' />;
    }
    return (
      <main>
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
        {this.state.searchResults.error && (
          <div className='errorMessage'>An error occured on server please try later</div>
        )}
        {this.state.searchResultsLoading && <img className='loading' src={loadingSvg} alt='loading' />}
        {this.state.searchResults.results && this.state.searchResults.results.length === 0 && (
          <div className='errorMessage'>No hits please try another keyword or add and astrisk(*)</div>
        )}
        {this.state.searchResults.results &&
          this.state.searchResults.results.map((result, i) => (
            <div key={i} className='card'>
              <h3 className='card-title'>{result.name}</h3>
              <div className='card-body'>
                <p>{result.details}</p>
                <span>Seeds: {result.seeds}</span>
              </div>
              <div className='card-action'>
                <Link href={`/torrent?link=${result.link}`} prefetch={i < 3}>
                  <button className='primary' onClick={this.loadingTorrent}>
                    Open this
                  </button>
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
