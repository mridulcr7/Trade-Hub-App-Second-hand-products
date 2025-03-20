import { useState, useEffect } from "react";
import axios from "axios";

const useGeolocation = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });

                try {
                    const api = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
                    const response = await axios.get(api);
                    setAddress(response.data.display_name);
                    // console.log(api);
                } catch (err) {
                    setError("Error fetching address");
                }
            },
            (err) => setError(err.message)
        );
    }, []);

    return { location, address, error };
};

export default useGeolocation;
