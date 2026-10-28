export interface ArtPiece {
  id:           string
  title:        string
  caption:      string | null
  image_url:    string
  width:        number | null
  height:       number | null
  tags:         string[]
  product_id:   string | null
  sort_order:   number
  is_published: boolean
  created_at:   string
}

/** What the public gallery gets: the shop link is only present when that product is live. */
export type PublicArtPiece = Omit<ArtPiece, 'is_published' | 'sort_order' | 'created_at' | 'product_id'> & { shop_id: string | null }
