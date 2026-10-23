# Resin Calculator

![Screenshot-1](public/page-one.png)

A web calculator for epoxy casting. Pick a shape, enter your mold dimensions, pieces, waste margin and mix ratio — it shows how much resin and hardener to pour.

Results update live as you type (with a no-JavaScript fallback), and the URL keeps itself shareable. Volumes are calculated in ml (1 ml = 1 cm³). The mix ratio is applied by volume.

## Run locally

```sh
bin/setup
bin/dev
```

Then open <http://localhost:3000>.

## Tests

```sh
bin/rails test                      # server-side calculation and page tests
node --test test/javascript         # live calculation math
bin/rails test:system               # browser test, needs Firefox
```

The browser test uses headless Firefox; Selenium manages the driver.
