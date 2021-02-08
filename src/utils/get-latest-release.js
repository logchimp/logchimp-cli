const {Octokit} = require('@octokit/rest')

const octokit = new Octokit()

const getLatestRelease = async () => {
  // get releases
  try {
    const response = await octokit.repos.listReleases({
      owner: 'logchimp',
      repo: 'logchimp',
      per_page: 1,
      page: 1,
    })

    return response.data[0]
  } catch (error) {
    return error
  }
}

module.exports = getLatestRelease
