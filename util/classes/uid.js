const uid = () => {
  const head = Date.now().toString(36).toUpperCase();
  const tail = Math.random().toString(36).toUpperCase().substr(2);
  return head + tail;
};

module.exports = uid;
