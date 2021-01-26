import { runPrerender, detectPrerenderRoutes } from '@redwoodjs/prerender'

import c from '../lib/colors'

export const command = 'prerender'
export const aliases = ['render']
export const description = 'Prerender pages of a redwood app (experimental)'

export const builder = (yargs) => {
  yargs.option('input', {
    alias: 'input',
    default: false,
    description: 'Input file to prerender',
    type: 'string',
  })

  yargs.option('output', {
    alias: 'output',
    default: false,
    description: 'Output path',
    type: 'string',
  })

  yargs.option('dryrun', {
    alias: 'd',
    default: false,
    description: 'Run prerender and output to console',
    type: 'boolean',
  })
}

const mapRouterPathToHtml = (routerPath) => {
  if (routerPath === '/') {
    return 'web/dist/index.html'
  } else {
    return `web/dist${routerPath}.html`
  }
}

export const handler = async ({ input, output, dryrun }) => {
  if (input) {
    runPrerender({
      inputComponentPath: input,
      outputHtmlPath: output,
      dryRun: dryrun,
    })

    return
  }

  const prerenderRoutes = detectPrerenderRoutes()

  // @TODO for <Private> routes only render whileLoading or the layout
  prerenderRoutes.map(async (routeToPrerender) => {
    const outputHtmlPath = mapRouterPathToHtml(routeToPrerender.path)

    try {
      await runPrerender({
        inputComponentPath: routeToPrerender.filePath,
        outputHtmlPath,
        dryRun: dryrun,
      })

      console.log(
        `✅  ${c.green(routeToPrerender.path)} -> ${c.green(outputHtmlPath)}`
      )
    } catch (e) {
      console.error(
        `❌  ${c.error(routeToPrerender.name)} failed to rerender: ${c.info(
          routeToPrerender.filePath
        )}`
      )
      console.log(
        c.warning(
          `This means you won't get a prerendered page, but your Redwood app should still work fine. \nIt often means that a library you are using, or your code, is not optimised for SSR \n`
        )
      )
      console.error(e)
      console.log(c.info('------------------------------------------------'))
      return
    }
  })
}