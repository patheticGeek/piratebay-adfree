import React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import { PageTransition } from 'next-page-transitions';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import '../assets/index.css';

const TIMEOUT = 300;

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Head>
          <title>Piratebay adfree</title>
          <link
            href='https://fonts.googleapis.com/css?family=Montserrat:300,400,500,700,800&display=swap'
            rel='stylesheet'
          />
          <meta type='description' content='Torrenting so easy even girls can do it' />
          <meta
            type='og:description'
            property='og:description'
            content='Torrenting so easy even girls can do it'
          />
        </Head>
        <Navbar />

        <PageTransition
          timeout={TIMEOUT}
          classNames='page-transition'
          loadingComponent={<Loader />}
          loadingDelay={300}
          loadingTimeout={{
            enter: TIMEOUT,
            exit: 0
          }}
          loadingClassNames='loading-indicator'
        >
          <Component {...pageProps} />
          <div className='credits'>
            Made by <a href='https://instagram.com/pathetic_geek'>@pathetic_geek</a>
          </div>
        </PageTransition>
        <style jsx global>{`
          .page-transition-enter {
            opacity: 0;
            transform: translate3d(0, -30px, 0);
          }
          .page-transition-enter-active {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            transition: opacity ${TIMEOUT}ms, transform ${TIMEOUT}ms;
          }
          .page-transition-exit {
            opacity: 1;
          }
          .page-transition-exit-active {
            opacity: 0;
            transition: opacity ${TIMEOUT}ms;
          }
          .loading-indicator-appear,
          .loading-indicator-enter {
            opacity: 0;
          }
          .loading-indicator-appear-active,
          .loading-indicator-enter-active {
            opacity: 1;
            transition: opacity ${TIMEOUT}ms;
          }
        `}</style>
      </Container>
    );
  }
}

export default MyApp;
