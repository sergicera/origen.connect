import { IconButton } from "@mui/material";
import PropTypes from "prop-types";

export default function ColorModeToggle({ darkMode, onChange }) {
  return (
    <IconButton onClick={onChange} sx={{ ml: 1 }}>
      {darkMode ? (
        <i className="fa-sharp fa-thin fa-moon" />
      ) : (
        <i className="fa-sharp fa-thin fa-sun" />
      )}
    </IconButton>
  );
}

ColorModeToggle.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
