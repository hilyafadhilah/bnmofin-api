# API Contract


---------------------------------------------------------------------------


## Error

#### Universal errors

| HTTP code | Error name      | Description                                |
| --------- | --------------- | ------------------------------------------ |
| `501`     | `ServerError`  | Internal server error                      |
| `400`     | `InvalidInput` | Request param/body doesn't pass validation |

#### Error response body

```typescript
{
  error: {
    name: string,
    title: string,
    message: string,
  },
  data: any,
}
```


---------------------------------------------------------------------------


## Authorization Middleware

Use authorization bearer token.

Roles: `admin`, `customer`.

HTTP error response code: `401`

| Error name      | Description        |
| --------------- | ------------------ |
| `Unauthorized`  | Insufficient role  |
| `TokenExpired` | Token expired      |
| `InvalidToken` | Invalid/null token |

> If any token is given as headers, it will be checked for validity
> regardless of the required role for the requested resource.


---------------------------------------------------------------------------


## Collections

Pagination options are specified using **query parameters**,
alongside search query parameters.

| Parameter  | Value                 | Description               |
| ---------- | --------------------- | ------------------------- |
| `page`     | integer >= 1          | Requested page            |
| `pageSize` | `25 | 50 | 100 | 250` | Number of items in a page |

The returned response is:

```typescript
{
  meta: {
    page: number,
    pageSize: number,
    totalItems: number, // regardless of pagination
    totalPages: number,
  },
  data: Array<RequestedResource>
}
```

> In this document, endpoints that return collection will be marked
> as collection and will only specify the return type of the data.


---------------------------------------------------------------------------


## Resources

### Authentication

#### Login

- Path: `/auth`
- Method: `POST`

- Request Body

  ```typescript
  {
    username: string,
    password: string,
  }
  ```

- Response (HTTP `200`)

  ```typescript
  {
    token: string,
    user: {
      id: string,
      username: string,
      role: Role,
    },
  }
  ```

- Errors

  | HTTP code | Error name          | Data       | Description        |
  | --------- | ------------------- | ---------- | ------------------ |
  | `404`     | `USERNAME_NOTFOUND` | `username` | Username not found |
  | `401`     | `WrongPassword`    |            | Wrong password     |


#### Get Current User

- Path: `/auth`
- Method: `GET`

- Response (HTTP `200`)

  ```typescript
  {
    id: string,
    username: string,
    role: Role,
  }
  ```


### Customer

#### Register

- Path: `/customer`
- Method: `POST`

- Request Body

  ```typescript
  {
    fullname: string,
    idCardImage: File,
    user: {
      username: string,
      password: string,
    },
  }
  ```
  > Accepted file types: JPEG, PNG, GIF

- Response (HTTP `200`)

  ```typescript
  {
    userId: number,
    fullname: string,
    idCardImage: File,
    user: {
      id: number,
      username: string,
      role: string,
    },
  }
  ```

- Errors

  | HTTP code | Error name          | Data       | Description             |
  | --------- | ------------------- | ---------- | ----------------------- |
  | `400`     | `UsernameTaken`    | `username` | Username already exists |


### Get Customers

- Path: `/customer`
- Method: `GET`
- Authorized roles: `all`
- Type: **Collection**

- Request Query:

  ```typescript
  {
    /* roles: all */
    userId?: number,
    username?: string,
    fullname?: string,

    /* roles: admin */
    balance?: number,
    status?: 'verified' | 'unverified',
  }
  ```

  > `customer` role can only access `verified` status.

- Response (HTTP `200`)

  ```typescript
  /* Array of */
  {
    /* roles: all */
    userId: number,
    fullname: string,
    user: {
      username: string,
    },

    /* roles: admin */
    balance: number,
    status: 'verified' | 'unverified',
    idCardImage: string,
  }
  ```

### Get Particular Customer

- Path: `/customer/:userId`
- Method: `GET`
- Authorized roles: `all`
- Type: **Collection**

- Request Param:

  ```typescript
  {
    userId: number,
  }
  ```

- Response (HTTP `200`)

  ```typescript
  {
    /* roles: all */
    userId: number,
    fullname: string,
    user: {
      username: string,
    },

    /* roles: admin */
    balance: number,
    status: 'verified' | 'unverified',
    idCardImage: string,
  }
  ```