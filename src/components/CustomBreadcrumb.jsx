import Breadcrumb from "react-bootstrap/Breadcrumb";

const CustomBreadcrumb = ({ items }) => {
  return (
    <Breadcrumb>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return isLast ? (
          <Breadcrumb.Item active key={index}>
            {item.label}
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item href={item.href} key={index}>
            {item.label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default CustomBreadcrumb;
