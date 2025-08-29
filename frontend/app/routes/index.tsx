export default function IndexRedirect() {
  if (typeof window !== 'undefined') {
    window.location.replace('/home');
  }
  return null;
}


