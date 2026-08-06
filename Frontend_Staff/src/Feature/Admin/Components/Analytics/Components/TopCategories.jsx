import React from "react";

const TopCategories = ({ data }) => {
  const categories = data && data.length > 0 ? data : [
    { name: "Fast Food", percent: 0, colorClass: "fill-red" },
    { name: "Beverages", percent: 0, colorClass: "fill-orange" },
    { name: "Desserts", percent: 0, colorClass: "fill-yellow" },
    { name: "Salads", percent: 0, colorClass: "fill-green" },
  ];

  return (
    <div className="premium-chart-card" style={{ height: "100%" }}>
      <div className="chart-header-row">
        <div className="chart-title">Top Categories</div>
      </div>

      <div className="categories-list">
        {categories.map((cat, idx) => (
          <div key={idx} className="category-item">
            <div className="cat-info">
              <span>{cat.name}</span>
              <span className="cat-percent">{cat.percent}%</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${cat.colorClass}`}
                style={{ width: `${cat.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCategories;
