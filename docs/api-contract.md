# API Contract


---------------------------------------------------------------------------


## Error

#### Universal errors

| HTTP code | Error name      | Description                                |
| --------- | --------------- | ------------------------------------------ |
| `501`     | `SERVER_ERROR`  | Internal server error                      |
| `400`     | `INVALID_INPUT` | Request param/body doesn't pass validation |

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
| `UNAUTHORIZED`  | Insufficient role  |
| `TOKEN_EXPIRED` | Token expired      |
| `TOKEN_INVALID` | Invalid/null token |

> If any token is given as headers, it will be checked for validity
> regardless of the required role for the requested resource.


---------------------------------------------------------------------------


## Resources

### Authentication

#### Login

Path: `/auth`
Method: `POST`

Request Body

```typescript
{
  username: string,
  password: string,
}
```

Response (HTTP `200`)

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

Errors

| HTTP code | Error name          | Data       | Description        |
| --------- | ------------------- | ---------- | ------------------ |
| `404`     | `USERNAME_NOTFOUND` | `username` | Username not found |
| `401`     | `WRONG_PASSWORD`    |            | Wrong password     |


#### Get Current User

Path: `/auth`
Method: `GET`

Response (HTTP `200`)

```typescript
{
  id: string,
  username: string,
  role: Role,
}
```


### Customer

#### Register

Path: `/customer`
Method: `POST`

Request Body

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

Response (HTTP `200`)

```typescript
{
  id: number,
  fullname: string,
  idCardImage: File,
  user: {
    id: number,
    username: string,
    role: string,
  },
}
```

Errors

| HTTP code | Error name          | Data       | Description             |
| --------- | ------------------- | ---------- | ----------------------- |
| `400`     | `USERNAME_TAKEN`    | `username` | Username already exists |

