const getBuildInfo = (buildId, builds, cb) => {
    const build = builds.filter(build => build.id === buildId);
    if (!build.length)
        return cb(new Error(`Build with id ${buildId} is not found`));
    return cb(null, build[0]);
};

module.exports = getBuildInfo;