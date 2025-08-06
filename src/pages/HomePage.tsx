import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-title">
        Welcome to the Home Page
      </h1>
      <p className="mt-4 text-text-main">
        This is a protected area.
      </p>
    </div>
  );
};

export default HomePage;
