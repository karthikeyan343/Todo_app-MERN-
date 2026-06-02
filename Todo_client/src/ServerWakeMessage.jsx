const ServerWakeMessage = ({ title = 'Loading...' }) => {
  return (
    <div className="server-wake-message">
      <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
      <div>
        <h5 className="mb-1">{title}</h5>
        <p className="text-muted mb-0">
          The free hosting server may be waking up. This can take a few seconds and is not a website issue.
        </p>
      </div>
    </div>
  );
};

export default ServerWakeMessage;
