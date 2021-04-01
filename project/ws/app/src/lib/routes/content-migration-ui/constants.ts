export const isDummy = true
export const migrationApi = '/apis/protected/v8/content/migrate/curator'
export const contentCreatorIDsApi = '/usersubmission/usersubmission/user/v1/roles/content-creator/users'
export const userDetailsByIDApi = '/apis/protected/v8/user/details/detailV3'
export const allowedProperties = [
  'wid',
  'first_name',
  'last_name',
  'department_name',
]
export const dummyCuratorResponse = {
    ok: true, status: 200, data: [{
        department_name: 'Organization for Rare Diseases India ',
        first_name: 'Swapna ',
        last_name: 'Roopesh ',
        wid: '123',
      },
      {
        department_name: 'Societal Platform',
        first_name: 'Vyjayanthi',
        last_name: 'Mala',
        wid: '1234',
      }],
}
