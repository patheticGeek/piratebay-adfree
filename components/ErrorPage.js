import React from 'react';
import '../assets/notfound.css';

export default function ErrorPage(props) {
  return (
    <main className='not-found'>
      <div>
        <div>
          {props.code === 404 ? (
            <>
              <span>404 error</span>
              <span>page not found</span>
            </>
          ) : (
            <>
              <span>{props.code} error</span>
              <span>an error occured</span>
            </>
          )}
        </div>
      </div>
      <svg className='crack' viewBox='0 0 200 600'>
        <polyline points='118.302698 8 59.5369448 66.7657528 186.487016 193.715824 14 366.202839 153.491505 505.694344 68.1413353 591.044514' />
      </svg>
      <div>
        <div>
          <span>sorry about that!</span>
          <span>
            <a href='/'>
              <b>return home?</b>
            </a>
          </span>
        </div>
      </div>
    </main>
  );
}
