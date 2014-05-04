
require 'bindata'

module JDBeacon

  #
  # Data structure which represents the current state of a beacon board, 
  # in the binary format that will be exchanged with the board itself.
  #
  class State < BinData::Record

    # A look-up table that maps each of the possible beacon colors to 
    # their raw binary value.
    TEAMS = {
      :green => 0,
      :red   => 1,
      :none  => 2
    }

    #
    # A look-up table that maps each of the possible beacom _modes_
    # to their raw binary data.
    #
    MODES = {
      :off     => 0,
      :normal  => 1,
      :on      => 1,
      :frozen  => 27,
      :error   => 31,
    }

    # Stores a list of any fields which are "color fields".
    @color_fields = []
    class << self; attr_reader :color_fields; end
    

    #Prevent this record from re-defining its accessor methods at runtime.
    def self.define_field_accessors(*args); end

    #
    # Meta-method which allows the definition of fields which represent
    # a beacon color.
    #
    def self.color_field(name, bits)

      #First, add the appropriate field.
      send("bit#{bits}", name)

      #And identify this as a "color field" internally.
      @color_fields << name

      #And create getter/setters for the team colors.
      define_symbol_accessors(name, TEAMS)

    end

    #
    # Meta-method which creates getters and setter methods which
    # allow substitution of symbols for hard constants.
    #
    def self.define_symbol_accessors(name, collection)
      #Create a getter method, which automatically replaces the raw representation
      #of a color with a more descriptive symbol...
      define_method(name) do
        collection.key(self[name])
      end

      #... and create setter methods which automatically replace each color with the
      #correesponding raw binary representation.
      define_method("#{name}=") do |value| 
        self[name] = collection[value]
      end
    end


    # Indicates which team currently owns the beacon, if any.
    #
    # 0 = Green robot owns the beacon.
    # 1 = Red robot owns the beacon.
    # 2 = Neither robot owns the beacon.
    color_field :owner, 2


    # The affiliation of the beacon. 
    # This indicates which side of the board the beacon is on:
    #
    # 0 = Green robot side,
    # 1 = Red robot side
    color_field :affiliation, 1


    # The unique ID number for this beacon.
    #
    # A beacon value of zero means that this beacon has not yet been assigned an 
    # ID by its host, and a beacon value of 31 (all 1's) is prohibited, to ensure
    # that this value is always distinguishable from the sync byte. Any other 
    # value is a defined beacon ID.
    bit5 :mode
    define_symbol_accessors :mode, MODES


    #
    # Returns a snapshot of the given state; in this case with the color
    # values replaced with their raw symbols.
    #
    def snapshot

      #Get a raw snapshot of the beacon's state.
      snapshot = super

      #Replace any of the "color fields" with their appropriate symbol name.
      snapshot.each do |key, value| 

        #If this is a color field, modify it.
        #TODO: DRY up?
        if self.class.color_fields.include?(key.to_sym)

          #Replace the given field value with the appropriate color.
          snapshot[key] = TEAMS.key(value)

        elsif key.to_sym == :mode

          snapshot[key] = MODES.key(value)
        end


      end

      snapshot

    end


  end

end
