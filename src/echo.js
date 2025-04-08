import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'c26fecc5139b20c2965c',
  cluster: 'ap2',
  forceTLS: true,
});

export default echo;
