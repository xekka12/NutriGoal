import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="glass notfound__card">
        <div className="notfound__code">404</div>
        <h1 className="notfound__title">Page not found</h1>
        <p className="notfound__subtitle">
          The page you’re looking for doesn’t exist or was moved.
        </p>

        <div className="notfound__actions">
          <Link className="primarybtn notfound__btn" to="/dashboard">
            Back to Dashboard
          </Link>
          <Link className="softbtn notfound__btn" to="/login">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

