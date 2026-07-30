import { fetchJson } from './mockApi.js'

export const IdentityService = {
  async getUsers() {
    const data = await fetchJson('identity')
    return data.users
  },

  async getUserById(externalId) {
    const data = await fetchJson('identity')
    return data.users.find(u => u.externalId === externalId) ?? null
  },

  async getGroups() {
    const data = await fetchJson('identity')
    return data.groups
  },

  async getGroupById(id) {
    const data = await fetchJson('identity')
    return data.groups.find(g => g._id === id) ?? null
  },

  async getRoles() {
    const data = await fetchJson('identity')
    return data.roles
  },

  async getRoleById(id) {
    const data = await fetchJson('identity')
    return data.roles.find(r => r._id === id) ?? null
  },

  // Fetch a single entity of any type, with its cross-references resolved
  // into displayable objects. `type` is the URL segment: users | groups | roles.
  async getEntityDetail(type, id) {
    const data = await fetchJson('identity')
    const { users, groups, roles } = data

    if (type === 'users') {
      const user = users.find(u => u.externalId === id)
      if (!user) return null
      return {
        entity: user,
        groups: (user.groups ?? []).map(gid => groups.find(g => g._id === gid)).filter(Boolean),
        roles: (user.roles ?? []).map(rid => roles.find(r => r._id === rid)).filter(Boolean),
      }
    }

    if (type === 'groups') {
      const group = groups.find(g => g._id === id)
      if (!group) return null
      return {
        entity: group,
        members: (group.assignedUserIds ?? []).map(uid => users.find(u => u.externalId === uid)).filter(Boolean),
      }
    }

    if (type === 'roles') {
      const role = roles.find(r => r._id === id)
      if (!role) return null
      return {
        entity: role,
        assignedUsers: users.filter(u => (u.roles ?? []).includes(role._id)),
      }
    }

    return null
  },
}
