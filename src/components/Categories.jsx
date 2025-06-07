import { useNavigate } from "react-router-dom";

import { BsFillTvFill, BsLampFill } from "react-icons/bs";
import { IoBook, IoExtensionPuzzle } from "react-icons/io5";
import { PiCookingPotFill } from "react-icons/pi";
import { FaCat, FaDumbbell, FaStopwatch } from "react-icons/fa6";

// Dati delle categorie: label e icona
const categories = [
  { label: "ELETTRONICA", icon: <BsFillTvFill /> },
  { label: "ARREDO", icon: <BsLampFill /> },
  { label: "LIBRI", icon: <IoBook /> },
  { label: "GIOCHI", icon: <IoExtensionPuzzle /> },
  { label: "CUCINA", icon: <PiCookingPotFill /> },
  { label: "SPORT", icon: <FaDumbbell /> },
  { label: "ACCESSORI", icon: <FaStopwatch /> },
  { label: "ANIMALI", icon: <FaCat /> },
];

const Categories = ({ onSelect, activeCategory, className = "" }) => {
  const navigate = useNavigate();

  // Gestione del click su una categoria
  const handleClick = (label) => {
    if (onSelect) {
      onSelect(label);
    } else {
      navigate(`/category/${label}`);
    }
  };

  return (
    <div className={`custom-categories-wrapper ${className}`}>
      <ul className="category-menu pt-5 pb-5">
        {categories.map(({ label, icon }) => (
          <li
            key={label}
            className={`category-item ${activeCategory === label ? "active" : ""}`}
            onClick={() => handleClick(label)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleClick(label)}
          >
            <div className="icon-circle">{icon}</div>
            <div className="category-label">{label.toLocaleLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
