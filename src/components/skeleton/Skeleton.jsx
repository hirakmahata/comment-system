import "./Skeleton.css";
import PropTypes from "prop-types";

const Skeleton = ({ width = "unset", length = 5 }) => {
  const skeletions = Array.from({ length }, (_, idx) => (
    <div key={idx} className="skeleton-shape"></div>
  ));

  return (
    <div className="skeleton-loader" style={{ width }}>
      {skeletions}
    </div>
  );
};

Skeleton.propTypes = {
  width: PropTypes.string,
  length: PropTypes.number,
};

export default Skeleton;
