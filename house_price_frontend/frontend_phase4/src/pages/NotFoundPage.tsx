import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page">
      <header className="page-header">
        <span className="stamp">Not on record</span>
        <h1>404</h1>
        <p className="subtitle">The page you're looking for doesn't exist.</p>
      </header>
      <Link to="/" className="submit-btn link-btn">
        Back to home
      </Link>
    </div>
  );
}
