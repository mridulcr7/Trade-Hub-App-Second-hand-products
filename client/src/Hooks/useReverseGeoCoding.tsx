import { useState, useEffect } from "react";
import axios from "axios";

const useReverseGeocoding = (latitude?: number, longitude?: number) => {
    const [address, setAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (latitude && longitude) {
            const fetchAddress = async () => {
                try {
                    const api = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
                    // Debugging log

                    const response = await axios.get(api);

                    if (response.data.error) {
                        console.log(response); // Debugging log
                        setError("Reverse geocoding failed");
                        setAddress("Unknown Location");
                    } else {
                        setAddress(response.data.display_name);
                    }
                } catch (err) {
                    setError("Error fetching address");
                    setAddress("Unknown Location");
                }
            };

            fetchAddress();
        }
    }, [latitude, longitude]);

    return { address, error };
};

export default useReverseGeocoding;
