import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { BezierEdge } from "reactflow";

// Custom edge with animation
const CustomEdge = (props) => {
  const theme = useTheme();
  
  // Add animation class and custom styling to the standard BezierEdge
  return (
    <BezierEdge 
      {...props} 
      className={props.animated ? "animated-edge" : ""}
      style={{
        ...props.style,
        stroke: theme.palette.primary.main,
        strokeWidth: 2,
        animation: props.animated ? "flowAnimation 1s linear infinite" : undefined,
      }}
    />
  );
};

CustomEdge.propTypes = {
  animated: PropTypes.bool,
  style: PropTypes.object,
};

export default CustomEdge; 