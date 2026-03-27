import { useState } from "react";
import { configService } from "../services/configService";

export const useConfig = () => {
  const [config, setConfig] = useState(configService.get());

  const guardar = (nuevo) => {
    configService.save(nuevo);
    setConfig(nuevo);
  };

  return {
    config,
    guardar,
  };
};