var tests = [];
for (var file in window.__karma__.files) {
    if (/spec\//.test(file)) {
        tests.push(file);
    }
}

requirejs.config({
    baseUrl: 'js',
    paths: {
        spec: '../spec'
    },
    shim: {
    },
    deps: tests,
    callback: window.__karma__.start
});
