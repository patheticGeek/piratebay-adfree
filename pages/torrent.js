import React, { Component } from 'react';
import { withRouter } from 'next/router';
import 'isomorphic-fetch';
import '../assets/index.css';
const dev = process.env.NODE_ENV !== 'production';

class Torrent extends Component {
  static async getInitialProps({ query: { link } }) {
    const api = 'https://piratebay-adfree.herokuapp.com';
    const localhost = 'http://localhost:3000';
    const response = await fetch(`${dev ? localhost : api}/getTorrent?link=${link}`);
    if (response.status !== 200) {
      return { error: true, message: 'Cannot reach server' };
    }
    const torrentDetails = await response.json();
    return { ...torrentDetails };
  }

  state = {
    torrent: this.props.torrent,
    error: this.props.error,
    message: this.props.error ? this.props.message : ''
  };

  render() {
    return (
      <div className='torrentDetails'>
        <div className='card'>
          <h2 className='card-title'>{this.state.torrent.title}</h2>
          <div className='card-body'>
            {this.state.torrent.details.map((detail, i) => (
              <div className='inline' key={i}>
                <h4>{detail.infoTitle}</h4>
                <h4 className='right'>{detail.infoText}</h4>
              </div>
            ))}
            <div className='info-title'>Info from uploader</div>
            <pre className='info'>{this.state.torrent.info}</pre>
          </div>
          <div className='card-action'>
            <a href={this.state.torrent.downloadLink} className='button warning'>
              Download now
            </a>
          </div>
        </div>
        <div className='credits'>
          Made by <a href='https://instagram.com/pathetic_geek'>@pathetic_geek</a>
        </div>
      </div>
    );
  }
}

export default withRouter(Torrent);

//torrent: { title, uploaded, uploadedBy, seeds, info, downloadLink }
