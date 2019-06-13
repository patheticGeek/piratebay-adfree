import React, { Component } from 'react';
import { withRouter } from 'next/router';
import 'isomorphic-fetch';
import '../assets/index.css';

const port = parseInt(process.env.PORT, 10) || 3000;

class Torrent extends Component {
  static async getInitialProps({ query: { link } }) {
    const response = await fetch(`http://localhost:${port}/getTorrent?link=${link}`);
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
            <div className='inline'>
              <span>Uploaded by: {this.state.torrent.uploadedBy}</span>
              <span className='right'>Seeds: {this.state.torrent.seeds}</span>
            </div>
            <span>Uploaded on: {this.state.torrent.uploaded}</span>
            <div className='info-title'>Info from uploader</div>
            <pre className='info'>{this.state.torrent.info}</pre>
          </div>
          <div className='card-action'>
            <a href={this.state.torrent.downloadLink} className='button warning'>
              Download now
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Torrent);

//torrent: { title, uploaded, uploadedBy, seeds, info, downloadLink }
