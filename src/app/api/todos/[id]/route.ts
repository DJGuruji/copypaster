import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { Todo } from '@/lib/models';
import { authOptions } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';

// GET a single todo by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const { id } = await context.params;
    
    const todo = await Todo.findOne({ _id: id, user: session.user.id });
    
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    // Ensure all items have targetDate and status fields with defaults, and decrypt values
    const processedTodo = {
      ...todo.toObject(),
      items: todo.items.map((item: any) => ({
        ...item.toObject(),
        value: decrypt(item.value || ''),
        targetDate: item.targetDate || undefined,
        status: item.status || 'ETS'
      }))
    };
    
    return NextResponse.json(processedTodo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 });
  }
}

// PUT a single todo by ID
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const { id } = await context.params;
    const data = await request.json();

    if (data.items) {
      data.items = data.items.map((item: any) => {
        const processedItem = { ...item };
        
        // Encrypt value
        if (processedItem.value !== undefined) {
          processedItem.value = encrypt(processedItem.value || '');
        }

        if (processedItem._id && processedItem._id.startsWith('temp_')) {
          const { _id, ...itemWithoutId } = processedItem;
          // Ensure createdAt is set for new items
          if (!itemWithoutId.createdAt) {
            itemWithoutId.createdAt = new Date().toISOString();
          }
          // Ensure targetDate is properly formatted if it exists
          if (itemWithoutId.targetDate) {
            itemWithoutId.targetDate = new Date(itemWithoutId.targetDate);
          }
          // Ensure status is properly set for new items
          if (!itemWithoutId.status) {
            itemWithoutId.status = 'ETS';
          }
          return itemWithoutId;
        } else {
          // For existing items, ensure targetDate is properly formatted
          if (processedItem.targetDate) {
            processedItem.targetDate = new Date(processedItem.targetDate);
          }
          // Ensure status is properly set for existing items
          if (!processedItem.status) {
            processedItem.status = 'ETS';
          }
          return processedItem;
        }
      });
    }
    
    // Find and update todo only if it belongs to the current user
    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    // Decrypt before returning
    const responseTodo = {
      ...todo.toObject(),
      items: todo.items.map((item: any) => ({
        ...item.toObject(),
        value: decrypt(item.value || '')
      }))
    };

    return NextResponse.json(responseTodo);
  } catch (error) {
    console.error('Update todo error:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

// DELETE a single todo by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const { id } = await context.params;
    
    // Delete todo only if it belongs to the current user
    const todo = await Todo.findOneAndDelete({ _id: id, user: session.user.id });
    
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
