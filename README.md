# kindful-js (work in progress - not published)

TypeScript wrapper for Kindful Client API. More info on the Kindful APIs here: <https://developer.kindful.com/>

## Disclaimer

I have no affiliation with Kindful, I just needed an API wrapper so I decided to publish it.

## Requirements

A fetch polyfill is required to use this library if your nodejs version is < 18.x.x.

## Installation

```sh
npm install kindful-js

# or with yarn
yarn add kindful-js
```

## Thoughts

Honestly, the Kindful API doesn't really follow any design principles that I have ever seen before. Creating transactions is done directly on the user object as if it has been left-joined then flattened before being returned. I'm not sure if this is a design decision or just a side effect of the way the API is built. Either way, I'm not a fan of it.

Groups are even odder, since they are not a first-class citizen in the API. You can't create a group, you can only create a group membership. This is painful from a TypeScript perspective, since allowing arbitrary types that happen to be group names onto a contact is... less than ideal.

Looking at the types for this library in the ./types directory will probably be the best way to understand how to use it. I have done my best to attempt to simplify the API as much as possible, but there are definitely things that will come out of left field when using it.

If you see any issues in the TS implementation, please feel free to open an issue or PR. No way in hell I managed to get everything right on the first try.

Playing with the Postman collection is also a good way to get a feel for how the API works. <https://documenter.getpostman.com/view/7005508/S1EWQFhd>

Have fun trying to figure this one out (it won't be)!

## Usage

```ts
import Kindful from 'kindful-js';

const url = 'https://app-sandbox.kindful.com/api/v1' || 'https://app.kindful.com/api/v1';
const token = 'your token here';

const kindful = new Kindful(url, token);

// contact calls
const exists = kindful.contact.emailExists('email address');
const contacts = kindful.contact.query(['changed'], { contact: ['all'] });
const _ = kindful.contact.create([{ first_name: 'New', last_name: 'Person', email: 'new@person.com' }]);
const _ = kindful.contact.update([{ id: 'id_1234567', email: 'different@person.com' }]);

// transaction calls
const transactions = kindful.transaction.query(['changed'], { transaction: ['all'], contact: ['all'] });
const _ = kindful.transaction.withNewContact([{ first_name: 'New', last_name: 'Person', email: 'new@person.com', amount_in_cents: 500, transaction_time: new Date().toISOString(), fund: 'General', fund_id: '1' }]);
const _ = kindful.transaction.withContact([{ id: 'contact id', amount_in_cents: 500, transaction_time: new Date().toISOString(), fund: 'General', fund_id: '1' }]);

// group calls (very cursed)
const groups = ['group 1', 'group 2'];
const _ = kindful.group.createWithContact<typeof groups>({ first_name: 'New', last_name: 'Person', email: 'new@person.com' }, groups);
const _ = kindful.group.addContacts<typeof groups>(['contact id 1', 'contact id 2'], groups); // might also create a group if it doesn't exist? not sure

// meta calls
const campaigns = kindful.meta.campaigns();
const groups = kindful.meta.groups();
const chapters = kindful.meta.chapters();
const customFields = kindful.meta.customFields();
const customFieldGroups = kindful.meta.customFieldGroups();
const details = kindful.meta.details();
const funds = kindful.meta.funds();
const importStats = kindful.meta.importStats();

// escape to the API wrapper
const get = kindful.api.get<ResponseType>('/get-endpoint');
const post = kindful.api.post<BodyType, ResponseType>('/post-endpoint', { body: 'here' });
```
