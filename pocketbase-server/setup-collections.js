#!/usr/bin/env node

// Script to create PocketBase collections for the showcase app
// Run this after creating your admin account

import { createInterface } from 'readline';
import { stdin as input, stdout as output } from 'process';

const POCKETBASE_URL = 'http://127.0.0.1:8090';

// Collection schemas
const collections = [
  {
    name: 'chat_sessions',
    type: 'base',
    schema: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 200
        }
      },
      {
        name: 'userId',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 100
        }
      },
      {
        name: 'lastMessage',
        type: 'text',
        required: false,
        options: {
          max: 1000
        }
      },
      {
        name: 'created',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 100
        }
      },
      {
        name: 'updated',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 100
        }
      }
    ]
  },
  {
    name: 'chat_messages',
    type: 'base',
    schema: [
      {
        name: 'content',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 10000
        }
      },
      // {
      //   name: 'sender',
      //   type: 'select',
      //   required: true,
      //   values: ["user", "critic"],
      //   maxSelect: 1
        
      // },
      {
        name: 'timestamp',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 100
        }
      },
      {
        name: 'sessionId',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 100
        }
      },
      {
        name: 'personalityId',
        type: 'text',
        required: false,
        options: {
          max: 50
        }
      },
      {
        name: 'personalityName',
        type: 'text',
        required: false,
        options: {
          max: 100
        }
      },
      {
        name: 'personalityAvatar',
        type: 'text',
        required: false,
        options: {
          max: 10
        }
      },
      {
        name: 'personalityColor',
        type: 'text',
        required: false,
        options: {
          max: 50
        }
      },
      {
        name: 'imageUrl',
        type: 'text',
        required: false,
        options: {
          max: 10000
        }
      }
    ]
  }
];

async function setupCollections() {
  console.log('PocketBase Collection Setup');
  console.log('==========================\n');
  
  console.log('Please make sure you have:');
  console.log('1. Started PocketBase (./pocketbase serve)');
  console.log('2. Created an admin account by visiting:');
  console.log('   http://127.0.0.1:8090/_/\n');
  
  const rl = createInterface({ input, output });
  
  function askQuestion(question) {
    return new Promise(resolve => {
      rl.question(question, resolve);
    });
  }
  
  try {
    const email = await askQuestion('Enter your admin email: ');
    const password = await askQuestion('Enter your admin password: ');
    
    console.log('\nAuthenticating...');
    
    // Authenticate as admin
    const authResponse = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identity: email,
        password: password
      })
    });
    
    if (!authResponse.ok) {
      throw new Error('Authentication failed. Please check your credentials.');
    }
    
    const authData = await authResponse.json();
    const token = authData.token;
    
    console.log('Authentication successful!\n');
    
    // Create collections
    for (const collection of collections) {
      console.log(`Creating collection: ${collection.name}`);
      
      // Convert schema to PocketBase format
      const fields = collection.schema.map(field => {
        const baseField = {
          name: field.name,
          type: field.type,
          required: field.required,
          system: false
        };
        
        if (field.type === 'text') {
          baseField.options = {
            min: field.options?.min || null,
            max: field.options?.max || null,
            pattern: ""
          };
        } else if (field.type === 'select') {
          baseField.options = {
            values: field.options?.values || [],
            maxSelect: field.options?.maxSelect || 1
          };
        }
        
        return baseField;
      });
      
      const collectionData = {
        name: collection.name,
        type: collection.type,
        fields: fields,
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null
      };
      
      // Debug: log the data being sent
      if (collection.name === 'chat_messages') {
        console.log('Debug - Fields being sent:', JSON.stringify(fields, null, 2));
      }
      
      const response = await fetch(`${POCKETBASE_URL}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(collectionData)
      });
      
      if (response.ok) {
        console.log(`✓ Collection '${collection.name}' created successfully`);
      } else {
        const errorText = await response.text();
        console.log(`✗ Failed to create collection '${collection.name}': ${errorText}`);
        
        // If collection already exists OR has validation errors, try to update it with fields
        if (errorText.includes('already exists') || errorText.includes('validation_required')) {
          console.log(`  Attempting to update existing collection...`);
          
          // First get the collection
          const getResponse = await fetch(`${POCKETBASE_URL}/api/collections?filter=(name='${collection.name}')`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (getResponse.ok) {
            const collections = await getResponse.json();
            if (collections.items && collections.items.length > 0) {
              const existingCollection = collections.items[0];
              
              // Update with our fields
              const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/${existingCollection.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  fields: fields
                })
              });
              
              if (updateResponse.ok) {
                console.log(`  ✓ Updated collection '${collection.name}' with fields`);
              } else {
                const updateError = await updateResponse.text();
                console.log(`  ✗ Failed to update collection: ${updateError}`);
              }
            }
          }
        }
      }
    }
    
    console.log('\nCollection setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

setupCollections();