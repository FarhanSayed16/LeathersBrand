import React, { useEffect, useState } from "react";
import axios from "axios";
import HeroUploadCard from "../components/HeroUploadCard";
import { backendUrl } from "../App";

const HeroManager = () => {
  const [heroes, setHeroes] = useState([]);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    const res = await axios.get(`${backendUrl}/api/admin/hero`, {
      headers: {
        token: localStorage.getItem("token")
      }
    });

    if (res.data.success) {
      setHeroes(res.data.heroes);
    }
  };

  const getHeroBySequence = (seq) =>
    heroes.find((h) => h.sequence === seq);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-bold text-center">
        Hero Banner Manager
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((seq) => (
          <HeroUploadCard
            key={seq}
            sequence={seq}
            existingHero={getHeroBySequence(seq)}
            onUpdated={fetchHeroes} // 🔁 auto refresh
          />
        ))}
      </div>
    </div>
  );
};

export default HeroManager;