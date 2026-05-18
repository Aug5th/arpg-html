export const worldToIso = (x, y) => {
    return {
        x: (x - y),
        y: (x + y) * 0.5
    };
};

export const isoToWorld = (isoX, isoY) => {
    return {
        x: isoY + isoX * 0.5,
        y: isoY - isoX * 0.5
    };
};